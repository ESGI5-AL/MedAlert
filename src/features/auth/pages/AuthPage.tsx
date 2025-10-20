import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Wallet } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Fonction simulée pour la connexion MetaMask
  const handleMetaMaskConnect = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-accent flex items-start pt-60 justify-center p-4">
      <div className="flex items-center justify-center w-full">
        <Card className="w-full max-w-lg p-8 shadow-xl border-border">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-foreground">Connexion</CardTitle>
          <CardDescription className="text-muted-foreground">
            Connectez-vous à votre compte pour continuer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Button
              onClick={handleMetaMaskConnect}
              disabled={isLoading}
              className="gradient rounded-full w-3/4 text-primary-foreground font-semibold py-5 px-10 text-lg transition-all duration-200 flex items-center justify-center gap-3 border-0 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100 disabled:hover:shadow-lg"
            >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                Connexion en cours...
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5" />
                Se connecter avec MetaMask
              </>
            )}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default AuthPage;
