import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Wallet, AlertCircle } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { account, role, isConnecting, connectWallet } = useWeb3();

  useEffect(() => {
    if (account && role) {
      switch (role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'DOCTOR':
          navigate('/doctor');
          break;
        case 'PHARMACY':
          navigate('/pharmacist');
          break;
        case 'PATIENT':
          navigate('/patient');
          break;
        default:
          break;
      }
    }
  }, [account, role, navigate]);

  const handleMetaMaskConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-accent flex items-start pt-60 justify-center p-4">
      <div className="flex items-center justify-center w-full">
        <Card className="w-full max-w-lg p-8 shadow-xl border-border">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Connexion MedAlert
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Connectez votre portefeuille pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!window.ethereum && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  Veuillez installer MetaMask pour continuer
                </span>
              </div>
            )}
            <div className="flex justify-center">
              <Button
                onClick={handleMetaMaskConnect}
                disabled={isConnecting || !window.ethereum}
                className="gradient rounded-full w-3/4 text-primary-foreground font-semibold py-5 px-10 text-lg transition-all duration-200 flex items-center justify-center gap-3 border-0 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100 disabled:hover:shadow-lg"
              >
                {isConnecting ? (
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
