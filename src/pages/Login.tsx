import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../store';
import { Button, Input, Card } from '../components/ui';
import { Shield, ArrowRight } from 'lucide-react';

export default function Login() {
  const [name, setName] = useState('');
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name);
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: 'rgb(0, 35, 102)' }}>
      {/* Decorative background elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6 text-primary">
          <Shield size={64} strokeWidth={1.5} />
        </div>
        <h2 className="mt-6 text-center text-4xl font-display font-bold tracking-tight text-foreground">
          MEHS OL Training
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground font-mono">
          BY MONARCHS FOR MONARCHS
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="px-4 py-8 sm:px-10 border-accent/50 shadow-2xl shadow-primary/5">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2 uppercase tracking-wide font-display text-primary">
                Enter your name
              </label>
              <div className="mt-1">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary/50 border-accent h-12 text-lg"
                  placeholder="e.g. Coach Smith or John Doe"
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full h-12 text-lg group">
                Enter THE LION'S DEN
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
