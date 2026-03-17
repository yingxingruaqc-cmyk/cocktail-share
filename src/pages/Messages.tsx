import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button, LoadingSpinner } from '../components';
import type { Message, Profile, Conversation } from '../types';

export function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 获取对话列表
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      // 获取所有相关的消息
      const { data: allMessages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 按对方用户分组
      const conversationMap = new Map<string, { user_id: string; profile: Profile; lastMessage: Message; last_message: Message; unreadCount: number; unread_count: number }>();

      (allMessages as any[]).forEach((msg) => {
        const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
        if (!otherUser) return;

        if (!conversationMap.has(otherUser.id)) {
          conversationMap.set(otherUser.id, {
            user_id: otherUser.id,
            profile: otherUser,
            lastMessage: msg,
            last_message: msg,
            unreadCount: 0,
            unread_count: 0,
          });
        }

        // 统计未读消息
        if (msg.receiver_id === user.id && !msg.is_read) {
          const conv = conversationMap.get(otherUser.id)!;
          conv.unreadCount++;
        }
      });

      // 转换为数组并按最后消息时间排序
      const convList = Array.from(conversationMap.values()).sort((a, b) =>
        new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      );

      setConversations(convList);
    } catch (err) {
      console.error('获取对话失败:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 获取与某个用户的消息
  const fetchMessages = useCallback(async (otherUserId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data as Message[]);

      // 标记为已读
      const unreadIds = (data as Message[])
        .filter((m) => m.receiver_id === user.id && !m.is_read)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadIds);

        fetchConversations(); // 刷新对话列表以更新未读数
      }
    } catch (err) {
      console.error('获取消息失败:', err);
    }
  }, [user, fetchConversations]);

  // 发送消息
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedUser || !messageText.trim()) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedUser.id,
          content: messageText.trim(),
        })
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*)
        `)
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, data as Message]);
      setMessageText('');
      fetchConversations(); // 刷新对话列表
    } catch (err) {
      alert('发送失败，请重试');
    } finally {
      setSending(false);
    }
  };

  // 选择对话
  const selectConversation = (conversation: Conversation) => {
    setSelectedUser(conversation.profile);
    fetchMessages(conversation.profile.id);
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 实时订阅消息
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(receiver_id.eq.${user.id},sender_id.eq.${user.id})`,
        },
        (payload) => {
          fetchConversations();
          if (selectedUser) {
            const newMessage = payload.new as Message;
            if (
              (newMessage.sender_id === user.id && newMessage.receiver_id === selectedUser.id) ||
              (newMessage.sender_id === selectedUser.id && newMessage.receiver_id === user.id)
            ) {
              fetchMessages(selectedUser.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedUser, fetchConversations, fetchMessages]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* 对话列表 */}
      <div className={`w-full md:w-80 border-r border-gray-200 bg-white ${selectedUser ? 'hidden md:block' : ''}`}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">私信</h1>
        </div>

        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">暂无对话</p>
            <p className="text-sm text-gray-400 mt-1">访问其他用户主页发起对话</p>
          </div>
        ) : (
          <div className="overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.profile.id}
                onClick={() => selectConversation(conv)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100 text-left ${
                  selectedUser?.id === conv.profile.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {conv.profile.avatar_url ? (
                    <img
                      src={conv.profile.avatar_url}
                      alt={conv.profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 font-medium">
                      {conv.profile.username[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {conv.profile.username}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(conv.lastMessage.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage.sender_id === user?.id ? '你: ' : ''}
                      {conv.lastMessage.content}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 w-5 h-5 bg-gray-900 text-white text-xs font-medium rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 消息区域 */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* 头部 */}
          <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3">
            <button
              onClick={() => setSelectedUser(null)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <Link
              to={`/profile/${selectedUser.id}`}
              className="flex items-center gap-3 hover:opacity-80"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 font-medium">
                    {selectedUser.username[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <span className="font-medium text-gray-900">{selectedUser.username}</span>
            </Link>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isCurrentUser = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-md ${
                      isCurrentUser
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${isCurrentUser ? 'text-gray-300' : 'text-gray-400'}`}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-3">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="输入消息..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <Button type="submit" disabled={!messageText.trim() || sending}>
                {sending ? '发送中...' : '发送'}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500">选择一个对话开始聊天</p>
          </div>
        </div>
      )}
    </div>
  );
}
