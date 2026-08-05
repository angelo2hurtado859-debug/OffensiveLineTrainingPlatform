import React from 'react';
import { useStore } from '../store';
import { Card, Button } from '../components/ui';
import { Users, BookOpen, Target, Trophy, Share2 } from 'lucide-react';

export default function Dashboard() {
  const { user, team } = useStore();

  if (user?.role === 'coach') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Coach Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage {team?.name || 'your team'}</p>
          </div>
          {team?.inviteCode && (
            <Button variant="outline" className="space-x-2" onClick={() => alert(`Invite Code: ${team.inviteCode}`)}>
              <Share2 size={16} />
              <span>Invite Players</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Players" value={team?.roster?.length || 0} icon={Users} />
          <StatCard title="Plays Installed" value="12" icon={BookOpen} />
          <StatCard title="Avg Accuracy" value="84%" icon={Target} />
          <StatCard title="Study Hours" value="42h" icon={Trophy} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-display text-xl font-bold mb-4">Team Roster</h3>
            <div className="space-y-3">
              {team?.roster?.map((p, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-secondary/30 rounded border border-border/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center font-bold text-sm">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      {p.positions && p.positions.length > 0 && (
                        <p className="text-xs text-muted-foreground">{p.positions.join(', ')}</p>
                      )}
                      {(!p.positions || p.positions.length === 0) && (
                         <p className="text-xs text-muted-foreground">{p.role === 'coach' ? 'Coach' : 'Player'}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-primary">88%</p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-display text-xl font-bold mb-4">Recent Activity</h3>
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">No recent activity.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Player Dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground mt-1">{team?.name || 'No Team Assigned'} {user?.positions && user.positions.length > 0 ? `• ${user.positions.join(', ')}` : ''}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Study Streak" value="3 Days" icon={Trophy} />
        <StatCard title="Plays Mastered" value="8/12" icon={BookOpen} />
        <StatCard title="My Accuracy" value="92%" icon={Target} />
        <StatCard title="Team Rank" value="#2" icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-primary/10 border-primary/30">
          <h3 className="font-display text-xl font-bold mb-2 text-primary">Next Assignment</h3>
          <p className="text-sm text-foreground mb-4">Coach Smith assigned "Inside Zone" review.</p>
          <Button>Start Training</Button>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: any }) {
  return (
    <Card className="p-5 flex items-center space-x-4">
      <div className="p-3 bg-secondary rounded-lg text-primary">
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-2xl font-bold font-mono">{value}</p>
      </div>
    </Card>
  );
}
