import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Trash2, Image as ImageIcon, Mic, Square, Play, Pause } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { commentApi } from '../api/comment.api';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSocket } from '../../../app/providers/SocketProvider';
import { getInitials, cn } from '../../../lib/utils';
import { formatTimeAgo } from '../../../lib/dateUtils';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../lib/axios';

export function CommentSection({ workspaceId, projectId, taskId, type = 'comment' }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const data = await commentApi.getComments(workspaceId, projectId, taskId, type);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [workspaceId, projectId, taskId, type]);

  // Socket Live Updates
  useEffect(() => {
    if (!socket) return;
    socket.emit('task:join', taskId);

    const handleNewComment = (data) => {
      if (data.taskId !== taskId) return;
      if (data.comment?.type !== type) return;
      setComments(prev => {
        if (prev.find(c => c._id === data.comment._id)) return prev;
        return [...prev, data.comment];
      });
    };

    const handleDeleteComment = (data) => {
      if (data.taskId !== taskId) return;
      setComments(prev => prev.filter(c => c._id !== data.commentId));
    };

    const handleTypingStart = (data) => {
      if (data.taskId !== taskId || data.userId === user._id) return;
      setTypingUsers(prev => {
        if (prev.find(u => u.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, name: data.name }];
      });
    };

    const handleTypingStop = (data) => {
      if (data.taskId !== taskId) return;
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    socket.on('comment:created', handleNewComment);
    socket.on('comment:deleted', handleDeleteComment);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.emit('task:leave', taskId);
      socket.off('comment:created', handleNewComment);
      socket.off('comment:deleted', handleDeleteComment);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, taskId, type, user]);

  // Auto-scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments.length]);

  const handleTyping = () => {
    if (!socket) return;
    socket.emit('typing:start', { taskId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { taskId });
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!newComment.trim()) return;
    setIsPosting(true);
    try {
      const newC = await commentApi.createComment(workspaceId, projectId, taskId, newComment, type);
      setComments(prev => {
        if (prev.find(c => c._id === newC._id)) return prev;
        return [...prev, newC];
      });
      setNewComment('');
      if (socket) socket.emit('typing:stop', { taskId });
    } catch (error) {
      toast.error('Failed to send');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await commentApi.deleteComment(workspaceId, projectId, taskId, commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  // === Image Upload ===
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image');
      return;
    }

    setIsPosting(true);
    try {
      // Upload file first
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await api.post(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // Create comment with attachment
      const newC = await commentApi.createCommentWithAttachment(
        workspaceId, projectId, taskId,
        '',
        type,
        'image',
        [uploadRes.data]
      );

      setComments(prev => {
        if (prev.find(c => c._id === newC._id)) return prev;
        return [...prev, newC];
      });
      toast.success('Image sent!');
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsPosting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // === Voice Recording ===
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await uploadVoice(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const uploadVoice = async (audioBlob) => {
    if (audioBlob.size === 0) return;
    setIsPosting(true);
    try {
      const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const newC = await commentApi.createCommentWithAttachment(
        workspaceId, projectId, taskId,
        '',
        type,
        'voice',
        [uploadRes.data]
      );

      setComments(prev => {
        if (prev.find(c => c._id === newC._id)) return prev;
        return [...prev, newC];
      });
      toast.success('Voice message sent!');
    } catch (error) {
      toast.error('Failed to send voice');
    } finally {
      setIsPosting(false);
    }
  };

  const addEmoji = (emoji) => {
    setNewComment(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const formatRecordingTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const placeholderText = type === 'update' ? 'Share update...' : 'Type a message...';
  const headerLabel = type === 'update' ? 'Updates' : 'Live Chat';

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          {headerLabel} ({comments.length})
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-80 scroll-smooth">
        {isLoading ? (
          <p className="text-sm text-slate-500 text-center py-4">Loading...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-500 italic text-center py-4">
            {type === 'update' ? 'No updates yet.' : 'No messages yet. Say hi! 👋'}
          </p>
        ) : (
          <AnimatePresence>
            {comments.map(comment => {
              const isOwn = comment.author?._id === user?._id;
              const isImage = comment.messageType === 'image' || comment.attachments?.[0]?.type === 'image';
              const isVoice = comment.messageType === 'voice' || comment.attachments?.[0]?.type === 'audio';
              
              return (
                <motion.div 
                  key={comment._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2 group", isOwn ? "flex-row-reverse" : "flex-row")}
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs shrink-0">
                    {comment.author?.avatar?.url ? (
                      <img src={comment.author.avatar.url} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : getInitials(comment.author?.name)}
                  </div>
                  <div className={cn("flex-1 min-w-0 max-w-[80%]", isOwn ? "items-end" : "items-start", "flex flex-col")}>
                    <div className={cn("flex items-center gap-2 mb-1", isOwn && "flex-row-reverse")}>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">{comment.author?.name}</span>
                      <span className="text-[10px] text-slate-500">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <div className={cn(
                      "p-2.5 rounded-2xl relative",
                      isOwn 
                        ? "bg-indigo-600 text-white rounded-tr-sm" 
                        : type === 'update'
                          ? "bg-amber-50 dark:bg-amber-900/10 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                    )}>
                      {isImage && comment.attachments?.[0]?.url && (
                        <img 
                          src={comment.attachments[0].url} 
                          alt="attachment" 
                          className="rounded-lg max-w-full max-h-48 mb-2"
                        />
                      )}
                      {isVoice && comment.attachments?.[0]?.url && (
                        <audio controls src={comment.attachments[0].url} className="max-w-full mb-2" />
                      )}
                      {comment.content && <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>}
                    </div>
                  </div>
                  {isOwn && (
                    <button onClick={() => handleDelete(comment._id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all self-center">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic">
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            {typingUsers.map(u => u.name).join(', ')} typing...
          </div>
        )}
      </div>

      {/* Recording Bar */}
      {isRecording && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-red-700 dark:text-red-400">
            Recording... {formatRecordingTime(recordingTime)}
          </span>
          <button
            onClick={stopRecording}
            className="ml-auto p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <Square className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="flex items-end gap-1 relative">
        {/* Image Upload Button */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleImageUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          title="Send image"
        >
          <ImageIcon className="h-5 w-5" />
        </button>

        {/* Voice Record Button */}
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            "p-2 rounded-full",
            isRecording 
              ? "text-red-500 bg-red-50 dark:bg-red-900/20" 
              : "text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          title="Record voice"
        >
          {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            rows={1}
            placeholder={placeholderText}
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2.5 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none pr-10"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-3 top-3 text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <Smile className="h-5 w-5" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-14 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 flex gap-1 z-10">
              {['👍', '❤️', '🔥', '😂', '🎉', '😮'].map(emoji => (
                <button key={emoji} type="button" onClick={() => addEmoji(emoji)} className="hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded text-lg">
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button type="button" onClick={handleSubmit} className="h-11 px-3" isLoading={isPosting} disabled={!newComment.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}