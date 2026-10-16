import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Keyboard, Heart, GraduationCap, Trophy, Music2 } from 'lucide-react';
import { Button, Card } from '../components/ui';

const shortcuts = [
  ['D', 'Toggle Manual Draw for the selected lineman'],
  ['R', 'Shuffle the defensive front'],
  ['Space', 'Run the current rep'],
  ['1–5', 'Select LT, LG, C, RG, or RT'],
  ['6', 'Select TE when the formation includes one'],
  ['Ctrl + Z', 'Undo the last point while drawing'],
  ['Shift + Delete', 'Clear the current drawing'],
  ['?', 'Show shortcut help'],
];

export default function About() {
  const navigate = useNavigate();
  return <div className="mx-auto max-w-4xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft size={16} className="mr-2"/>Back</Button>
      <span className="rounded border border-primary/40 px-3 py-1 text-xs font-bold tracking-[.2em] text-primary">OLA · MEHS</span>
    </div>
    <Card className="overflow-hidden border-primary/30 p-0">
      <div className="bg-gradient-to-br from-[#10264b] via-[#091629] to-[#050b14] p-8 sm:p-12">
        <p className="mb-3 text-xs font-bold tracking-[.25em] text-primary">THE STORY BEHIND THE PLATFORM</p>
        <h1 className="mb-4 text-4xl font-display font-bold sm:text-5xl">Built for the Team</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-300">A student-built tool shaped by commitment to offensive-line development, Mount Eden High School, and the teammates who make the work worthwhile.</p>
      </div>
      <div className="space-y-5 p-6 sm:p-9">
        <p className="leading-7 text-muted-foreground">This platform began with a simple goal: give teammates better access to the knowledge, preparation, and tools needed to become a stronger offensive line. It was built for the team, not just as another website.</p>
        <p className="leading-7 text-muted-foreground">Starting with little coding experience meant learning unfamiliar concepts, solving technical problems, and steadily building new skills. Over months of learning and additional months of development, that effort became a platform designed around the details of offensive-line play: defensive fronts, individual assignments, blocking rules, and repeatable practice.</p>
        <p className="leading-7 text-muted-foreground">The work happens alongside other commitments. Its creator serves as a football team captain, bass section leader in choir, and class president while taking AP classes. Those responsibilities demand preparation, consistency, leadership, and accountability—qualities that also shaped the development of this app.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-secondary/30 p-4"><Trophy className="mb-3 text-primary" size={22}/><p className="font-bold">Football Captain</p><p className="mt-1 text-xs text-muted-foreground">Committed to teammates and program growth.</p></div>
          <div className="rounded-lg border border-border bg-secondary/30 p-4"><Music2 className="mb-3 text-primary" size={22}/><p className="font-bold">Bass Section Leader</p><p className="mt-1 text-xs text-muted-foreground">Helping a choir work together with discipline.</p></div>
          <div className="rounded-lg border border-border bg-secondary/30 p-4"><GraduationCap className="mb-3 text-primary" size={22}/><p className="font-bold">Class President · AP Student</p><p className="mt-1 text-xs text-muted-foreground">Balancing leadership, academics, and building.</p></div>
        </div>
        <p className="leading-7 text-muted-foreground">The reason for taking on this challenge is personal: a deep love for Mount Eden and its football team. The hope is that the work put into this platform gives players a better way to learn, prepares the team to compete, and leaves something useful for the program beyond one season.</p>
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-5 text-center"><Heart className="mx-auto mb-2 text-primary" size={22}/><p className="font-display text-2xl font-bold text-primary">The mission is simple: make the team better.</p><p className="mt-2 text-xs font-bold tracking-[.2em]">DISCIPLINE. ATTITUDE. TOGETHER.</p></div>
      </div>
    </Card>
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2"><Keyboard className="text-primary" size={20}/><h2 className="text-2xl font-display font-bold">Keyboard Shortcuts</h2></div>
      <p className="mb-4 text-sm text-muted-foreground">Use these while the field editor is active. Shortcuts are ignored while typing in text fields.</p>
      <div className="divide-y divide-border">{shortcuts.map(([key, label])=><div key={key} className="flex items-center justify-between gap-4 py-3"><span className="text-sm">{label}</span><kbd className="shrink-0 rounded border border-border bg-secondary px-2 py-1 font-mono text-xs text-primary">{key}</kbd></div>)}</div>
      <p className="mt-4 text-xs text-muted-foreground">Note: shortcuts operate on the field editor. Undo removes the last point of an active draft drawing.</p>
    </Card>
  </div>;
}
