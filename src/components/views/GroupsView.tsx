import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Send, Users } from 'lucide-react';
import {
  AlumniGroup,
  Alumnus,
  Institution,
  InstitutionTheme,
  WorkspaceId,
} from '../../types/alumni';
import { AlumniAvatar, EmptyState } from '../ui/CommonUI';

interface GroupsViewProps {
  activeWorkspace: WorkspaceId;
  institutions: Institution[];
  groups: AlumniGroup[];
  alumni: Alumnus[];
  theme: InstitutionTheme;
  onToggleJoinGroup: (groupId: string) => void;
  onAddGroupPost: (groupId: string, content: string) => void;
  onAddDiscussionReply: (groupId: string, discussionId: string, content: string) => void;
  onOpenAlumnus: (alumnus: Alumnus) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  activeWorkspace,
  institutions,
  groups,
  alumni,
  theme,
  onToggleJoinGroup,
  onAddGroupPost,
  onAddDiscussionReply,
  onOpenAlumnus,
}) => {
  const [activeTab, setActiveTab] = useState<'batch' | 'regional' | 'club'>('batch');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupSubTab, setGroupSubTab] = useState<'feed' | 'members' | 'discussions'>('feed');
  const [postDraft, setPostDraft] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const visibleGroups = groups.filter((g) => {
    const matchesWorkspace =
      activeWorkspace === 'all' || g.institutionId === activeWorkspace || g.institutionId === 'all';
    return matchesWorkspace && g.category === activeTab;
  });

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null;

  if (selectedGroup) {
    const groupInst = institutions.find((i) => i.id === selectedGroup.institutionId);
    const groupMembers = alumni.filter((a) => selectedGroup.featuredMemberIds.includes(a.id));

    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => {
            setSelectedGroupId(null);
            setGroupSubTab('feed');
          }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Chapters & Batch Groups
        </button>

        {/* Dedicated Group Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="text-xs text-slate-500">
              {groupInst ? groupInst.name : 'Multi-Campus Chapter'} · {selectedGroup.locationOrYear} ·{' '}
              <span className="font-mono tabular-nums">
                {selectedGroup.memberCount.toLocaleString('en-IN')} members
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{selectedGroup.name}</h1>
            <p className="text-sm text-slate-600 leading-relaxed">{selectedGroup.description}</p>
            <div className="text-xs text-slate-500 pt-1">
              Chapter Lead: <span className="font-medium text-slate-800">{selectedGroup.leadName}</span> ·{' '}
              {selectedGroup.recentActivity}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleJoinGroup(selectedGroup.id)}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0"
            style={
              selectedGroup.joined
                ? { backgroundColor: '#F1F5F9', color: '#0F172A' }
                : { backgroundColor: theme.primary, color: '#FFFFFF' }
            }
          >
            {selectedGroup.joined ? 'Joined Group' : 'Join Group'}
          </button>
        </div>

        {/* Dedicated Group Sub-Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 pb-2.5">
          {(
            [
              { id: 'feed', label: `Group Feed (${selectedGroup.posts.length})` },
              { id: 'members', label: `Featured Members (${groupMembers.length})` },
              { id: 'discussions', label: `Discussions (${selectedGroup.discussions.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setGroupSubTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                groupSubTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Group Feed Tab */}
        {groupSubTab === 'feed' && (
          <div className="space-y-4 max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!postDraft.trim()) return;
                onAddGroupPost(selectedGroup.id, postDraft.trim());
                setPostDraft('');
              }}
              className="bg-white border border-slate-200 rounded-xl p-4 space-y-3"
            >
              <textarea
                rows={2}
                value={postDraft}
                onChange={(e) => setPostDraft(e.target.value)}
                placeholder={`Post an update to ${selectedGroup.name}...`}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-400 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!postDraft.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-40"
                  style={{ backgroundColor: theme.primary }}
                >
                  Post to Group
                </button>
              </div>
            </form>

            {selectedGroup.posts.length === 0 ? (
              <EmptyState
                title="No group updates yet"
                description="Start the conversation by posting an introduction or meetup idea above."
              />
            ) : (
              selectedGroup.posts.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5"
                >
                  <div className="flex items-center gap-3">
                    <AlumniAvatar
                      name={msg.authorName}
                      initials={msg.authorInitials}
                      tone={msg.authorTone}
                      size="sm"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        {msg.authorName}{' '}
                        <span className="font-normal text-slate-400">· {msg.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{msg.authorRole}</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{msg.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Group Members Tab */}
        {groupSubTab === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => onOpenAlumnus(member)}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 flex items-center gap-3 text-left transition-colors"
              >
                <AlumniAvatar
                  name={member.name}
                  initials={member.initials}
                  tone={member.avatarTone}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {member.name}
                  </div>
                  <div className="text-xs text-slate-600 truncate">
                    {member.role} · {member.company}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{member.city}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Discussions Tab */}
        {groupSubTab === 'discussions' && (
          <div className="space-y-4 max-w-3xl">
            {selectedGroup.discussions.length === 0 ? (
              <EmptyState
                title="No discussion threads yet"
                description="Use the Group Feed to kick off a batch or chapter topic."
              />
            ) : (
              selectedGroup.discussions.map((disc) => (
                <div
                  key={disc.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{disc.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Started by {disc.startedBy} · {disc.timestamp} · {disc.replies.length} replies
                    </p>
                  </div>

                  <div className="space-y-2.5 pl-4 border-l border-slate-200">
                    {disc.replies.map((rep) => (
                      <div key={rep.id} className="text-xs space-y-0.5">
                        <div className="font-semibold text-slate-800">
                          {rep.authorName}{' '}
                          <span className="font-normal text-slate-400">· {rep.timestamp}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{rep.content}</p>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const text = replyDrafts[disc.id]?.trim();
                      if (!text) return;
                      onAddDiscussionReply(selectedGroup.id, disc.id, text);
                      setReplyDrafts((prev) => ({ ...prev, [disc.id]: '' }));
                    }}
                    className="flex items-center gap-2 pt-2 border-t border-slate-100"
                  >
                    <input
                      type="text"
                      value={replyDrafts[disc.id] ?? ''}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({ ...prev, [disc.id]: e.target.value }))
                      }
                      placeholder="Add your perspective to this thread..."
                      className="flex-1 h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-400"
                    />
                    <button
                      type="submit"
                      className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium inline-flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      Reply
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Chapters & Batch Groups
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Dedicated cohort circles, city chapters, and interest societies
          </p>
        </div>

        {/* Categorized Tabs */}
        <div className="inline-flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 self-start sm:self-auto">
          {(
            [
              { id: 'batch', label: 'My Batch Groups' },
              { id: 'regional', label: 'Regional Chapters' },
              { id: 'club', label: 'Clubs & Societies' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {visibleGroups.length === 0 ? (
        <EmptyState
          title="No groups in this category for the active campus"
          description="Switch to All Alma Maters or explore another category tab."
          actionLabel="View Regional Chapters"
          onAction={() => setActiveTab('regional')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleGroups.map((group) => {
            const inst = institutions.find((i) => i.id === group.institutionId);
            return (
              <div
                key={group.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 flex flex-col justify-between gap-4 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      {inst ? inst.shortName : 'Multi-Campus'} · {group.locationOrYear}
                    </span>
                    <span className="tabular-nums">{group.recentActivity}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedGroupId(group.id)}
                    className="text-left group"
                  >
                    <h3 className="text-base font-semibold text-slate-900 group-hover:underline">
                      {group.name}
                    </h3>
                  </button>
                  <p className="text-xs text-slate-600 leading-relaxed">{group.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs text-slate-500 tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {group.memberCount.toLocaleString('en-IN')}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {group.posts.length + group.discussions.length} threads
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleJoinGroup(group.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 whitespace-nowrap"
                    >
                      {group.joined ? 'Joined' : 'Join'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedGroupId(group.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-white whitespace-nowrap"
                      style={{ backgroundColor: theme.primary }}
                    >
                      Open Space
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
