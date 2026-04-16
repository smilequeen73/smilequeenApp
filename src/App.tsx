/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const today = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());

  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text: inputValue.trim(),
        completed: false,
        priority,
      };
      setTodos([newTodo, ...todos]);
      setInputValue('');
      setPriority('medium');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      setTodos(todos.map(todo => 
        todo.id === editingId ? { ...todo, text: editText.trim() } : todo
      ));
      setEditingId(null);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (p: string) => {
    switch (p) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '';
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const sortedTodos = [...todos].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-[375px] h-[667px] bg-white rounded-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.1),0_0_0_12px_#1a1a1a] flex flex-col overflow-hidden relative">
        {/* Status Bar (Visual only) */}
        <div className="h-11 px-8 flex justify-between items-center text-sm font-semibold text-[#1a1a1a]">
          <span>9:41</span>
          <div className="flex gap-1.5">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Header */}
        <header className="px-6 py-5 border-bottom border-[#edf2f7] border-b">
          <h1 className="text-2xl font-bold text-[#1a202c]">할 일 목록</h1>
          <p className="text-[13px] text-[#718096] mt-1">{today}</p>
        </header>

        {/* List Area */}
        <div className="flex-1 px-6 py-4 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {sortedTodos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-[#a0aec0]"
              >
                <p className="text-sm italic">목록이 비어 있습니다.</p>
              </motion.div>
            ) : (
              sortedTodos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center py-4 border-b border-[#f7fafc] group"
                >
                  {editingId === todo.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="flex-1 bg-[#f8fafc] border border-[#3182ce] rounded-lg px-2 py-1 text-[15px] outline-none"
                      />
                      <button onClick={saveEdit} className="text-[#3182ce] p-1">
                        <Check size={18} />
                      </button>
                      <button onClick={cancelEdit} className="text-[#a0aec0] p-1">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`w-[22px] h-[22px] border-2 rounded-md mr-3.5 flex items-center justify-center transition-all ${
                          todo.completed 
                            ? 'bg-[#3182ce] border-[#3182ce] text-white' 
                            : 'border-[#e2e8f0] bg-transparent'
                        }`}
                      >
                        {todo.completed && <span className="text-sm leading-none">✓</span>}
                      </button>
                      
                      <span className={`flex-1 text-[15px] transition-all flex items-center gap-2 ${
                        todo.completed ? 'text-[#a0aec0] line-through' : 'text-[#2d3748]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(todo.priority)}`} title={getPriorityLabel(todo.priority)} />
                        {todo.text}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(todo)}
                          className="text-[#718096] hover:text-[#3182ce] p-1"
                          aria-label="편집"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-[#e53e3e] hover:bg-red-50 p-1 rounded"
                          aria-label="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-[#edf2f7]">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    priority === p 
                      ? `${getPriorityColor(p)} text-white border-transparent` 
                      : 'bg-white text-[#718096] border-[#e2e8f0] hover:bg-[#f8fafc]'
                  }`}
                >
                  {getPriorityLabel(p)}
                </button>
              ))}
            </div>
            <div className="flex gap-2.5">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="새로운 할 일을 입력하세요..."
                className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#3182ce] focus:bg-white transition-all placeholder:text-[#a0aec0]"
              />
              <button
                onClick={addTodo}
                disabled={!inputValue.trim()}
                className="bg-[#3182ce] text-white px-5 rounded-xl font-semibold text-sm hover:bg-[#2b6cb0] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                추가
              </button>
            </div>
          </div>
          {/* Bottom Indicator */}
          <div className="h-[5px] w-[130px] bg-[#e2e8f0] rounded-full mx-auto mt-5" />
        </div>
      </div>
    </div>
  );
}
