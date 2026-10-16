import React from 'react';
import { Link } from 'react-router';
import { ArrowLeft, BookOpen, GraduationCap, Heart, Keyboard, Music2, Trophy } from 'lucide-react';
import { Button, Card } from '../components/ui';

const shortcuts = [
  ['1–5', 'Select LT, LG, C, RG, RT in the field editor.'],
  ['6', 'Select TE when a tight end is present.'],
  ['D', 'Toggle manual blocking-path drawing for the selected lineman.'],
  ['R', 'Shuffle the defensive front.'],
  ['Space', 'Run the practice rep.'],
  ['Ctrl / ⌘ + Z', 'Undo the most recent manual drawing point when drawing.'],
  ['Shift + Delete', 'Clear the current manual drawing.'],
  ['?', 'Show the shortcut reminder in the field editor.'],
];

export default function About() {
  return <div className="mx-auto max-w-4xl space-y-6">
    <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft size={16} /> Back to dashboard</Link>
    <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">The story behind OLA</p><h1 className="text-3xl font-display font-bold">Built for the O-Line</h1><p className="mt-2 text-muted-foreground">A football learning platform made for the players and program that inspired it.</p></div>
    <Card className="overflow-hidden"><div className="bg-gradient-to-r from-blue-950 to-slate-900 p-6 sm:p-9"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-primary/40 bg-primary/10"><Heart className="text-primary" size={28} /></div><h2 className="mb-3 text-2xl font-display font-bold">A project built out of commitment</h2><p className="max-w-3xl leading-7 text-slate-200">I started building this platform with little coding experience. It took months of learning how to code, followed by additional months of building, revising, and trying to make the tool useful. I wanted to create something that could help my teammates learn their assignments, prepare with confidence, and hold our offensive line to a higher standard. This project exists because I care about my team and my school, Mount Eden.</p><p className="mt-4 text-sm text-slate-300">Made by Former Monarch Angelo Hurtado</p></div><div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3"><div className="rounded-lg border border-border p-4"><Trophy className="mb-2 text-primary" /><p className="font-bold">Football team captain</p><p className="text-xs text-muted-foreground">Committed to helping teammates prepare and improve.</p></div><div className="rounded-lg border border-border p-4"><Music2 className="mb-2 text-primary" /><p className="font-bold">Choir bass section leader</p><p className="text-xs text-muted-foreground">Working with a group toward a shared standard.</p></div><div className="rounded-lg border border-border p-4"><GraduationCap className="mb-2 text-primary" /><p className="font-bold">Class president & AP student</p><p className="text-xs text-muted-foreground">Balancing leadership, academics, and building this project.</p></div></div></Card>
    <Card className="p-5 sm:p-7"><div className="mb-4 flex items-center gap-3"><Keyboard className="text-primary" size={24} /><div><h2 className="font-display text-xl font-bold">Field editor shortcuts</h2><p className="text-sm text-muted-foreground">Shortcuts work when the field editor is active, not while typing in a text field.</p></div></div><div className="divide-y divide-border">{shortcuts.map(([key, description]) => <div key={key} className="flex flex-wrap items-center gap-3 py-3"><kbd className="min-w-20 rounded border border-border bg-secondary px-3 py-1.5 text-center font-mono text-sm text-primary">{key}</kbd><p className="flex-1 text-sm">{description}</p></div>)}</div></Card>
    <div className="flex flex-wrap gap-3"><Link to="/playbook"><Button><BookOpen size={16} className="mr-2" /> Open Playbook</Button></Link><Link to="/avatar"><Button variant="outline">Customize Player Avatar</Button></Link></div>
  </div>;
}
