import React from 'react';
import { Plus } from 'lucide-react';
import { Story, User } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface StoriesTrayProps {
  stories: Story[];
  onOpenStory: (index: number) => void;
  onOpenCreateStory: () => void;
  compact?: boolean;
}

export const StoriesTray: React.FC<StoriesTrayProps> = ({
  stories,
  onOpenStory,
  onOpenCreateStory,
  compact = false
}) => {
  const { user } = useAuth();

  // Find user's own active story if any
  const myStoryIndex = stories.findIndex((s) => s.userId === user?.id);
  const myStory = myStoryIndex !== -1 ? stories[myStoryIndex] : null;

  // Filter friends' stories
  const friendsStories = stories.filter((s) => s.userId !== user?.id);

  const circleSize = compact ? 'w-11 h-11' : 'w-14 h-14';

  return (
    <div
      className={`w-full overflow-hidden select-none ${
        compact ? 'py-1 px-1 bg-transparent' : 'py-3 px-4 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md'
      }`}
    >
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5">
        {/* Your Story Circle */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button
            onClick={() => {
              if (myStory) {
                onOpenStory(myStoryIndex);
              } else {
                onOpenCreateStory();
              }
            }}
            className="relative group min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <div
              className={`${circleSize} rounded-full p-0.5 transition-transform group-active:scale-95 ${
                myStory
                  ? 'ring-2 ring-[#ff1e42] ring-offset-2 ring-offset-black'
                  : 'border border-neutral-800'
              }`}
            >
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt="Your Story"
                className="w-full h-full rounded-full bg-neutral-800 object-cover"
              />
            </div>

            {/* Plus / Active Story indicator */}
            {!myStory ? (
              <span className="absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full bg-[#ff1e42] text-white flex items-center justify-center ring-2 ring-black">
                <Plus className="w-3 h-3 stroke-[3]" />
              </span>
            ) : (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-black" />
            )}
          </button>
          <span className="text-[10px] font-semibold text-neutral-300 truncate max-w-[62px] text-center">
            {myStory ? 'Your Story' : 'Add Story'}
          </span>
        </div>

        {/* Friends Stories Circles */}
        {friendsStories.map((story) => {
          const originalIndex = stories.findIndex((s) => s.id === story.id);
          const isViewed = story.isViewed;

          return (
            <div key={story.id} className="flex flex-col items-center gap-1 shrink-0">
              <button
                onClick={() => onOpenStory(originalIndex)}
                className="group relative min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <div
                  className={`${circleSize} rounded-full p-0.5 transition-transform group-active:scale-95 ${
                    isViewed
                      ? 'ring-2 ring-neutral-700 ring-offset-2 ring-offset-black opacity-80'
                      : 'ring-2 ring-[#ff1e42] ring-offset-2 ring-offset-black'
                  }`}
                >
                  <img
                    src={story.user.avatar}
                    alt={story.user.name}
                    className="w-full h-full rounded-full bg-neutral-800 object-cover"
                  />
                </div>
              </button>
              <span className="text-[10px] font-medium text-white truncate max-w-[62px] text-center">
                @{story.user.username}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
