
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Enhanced markdown parser with polls and images
  const parseMarkdown = (text: string) => {
    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert ~~strikethrough~~ to <del>
    text = text.replace(/~~(.*?)~~/g, '<del class="opacity-75">$1</del>');
    
    // Convert `code` to <code>
    text = text.replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-1 rounded-md text-sm font-mono">$1</code>');
    
    // Convert images ![alt](src)
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4 shadow-sm" loading="lazy" />');
    
    // Convert polls **📊 Title** with 🔘 options
    text = text.replace(/\*\*📊 (.*?)\*\*\n((?:🔘.*?\n?)*)/g, (match, title, options) => {
      const optionList = options.split('\n').filter((opt: string) => opt.trim().startsWith('🔘')).map((opt: string) => {
        const optionText = opt.replace('🔘', '').trim();
        return `<label class="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
          <input type="radio" name="poll_${Math.random()}" class="w-4 h-4 text-primary" />
          <span>${optionText}</span>
        </label>`;
      }).join('');
      
      return `<div class="bg-muted/30 p-4 rounded-xl my-4 border">
        <h4 class="font-semibold mb-3 flex items-center gap-2">
          <span>📊</span>
          ${title}
        </h4>
        <div class="space-y-2">
          ${optionList}
        </div>
      </div>`;
    });
    
    // Convert line breaks to <br>
    text = text.replace(/\n/g, '<br />');
    
    // Convert ### Headers
    text = text.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>');
    
    // Convert ## Headers
    text = text.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-8 mb-4">$1</h2>');
    
    // Convert # Headers
    text = text.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-10 mb-5">$1</h1>');
    
    // Convert links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline underline-offset-2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    return text;
  };

  return (
    <div 
      className={`prose prose-sm max-w-none leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
};

export default MarkdownRenderer;
