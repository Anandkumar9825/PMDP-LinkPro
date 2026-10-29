import React from 'react';
import Card from '../Card/card';
import { ArrowRight, BookOpen } from 'lucide-react';

const TopCourses = () => {
  const courses = [
    {
      id: 1,
      number: '1.',
      title: 'Case Study UI/UX Design about medical app - HaDoc',
      author: 'Peter Wilson',
      viewers: '3.4k viewers',
    },
    {
      id: 2,
      number: '2.',
      title: 'How to make animation in Figma',
      author: 'Rose Stratton',
      viewers: '8.1k viewers',
    },
    {
      id: 3,
      number: '3.',
      title: 'Make illustration in Blender',
      author: 'Brandon Steward',
      viewers: '5.9k viewers',
    },
    {
      id: 4,
      number: '4.',
      title: 'How to make icon in Figma',
      author: 'Tom Nolan',
      viewers: '4.2k viewers',
    },
  ];

  return (
    <Card padding={false} className="shadow-sm p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Today's top courses
        </span>
        <button
          className="w-6 h-6 rounded-full flex items-center justify-center text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer"
          title="See all courses"
        >
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Courses List */}
      <div className="space-y-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="p-1 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
          >
            <div className="text-xs font-semibold leading-snug group-hover:text-sky-400 transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              <span className="mr-1 text-gray-400 font-normal">{course.number}</span>
              {course.title.replace(/^[0-9]+\.\s*/, '')}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5 pl-3">
              {course.author}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TopCourses;
