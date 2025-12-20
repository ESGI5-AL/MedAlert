import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ethers } from 'ethers';

import RegistrationABI from '../../artifacts/contracts/Registration.sol/Registration.json';
import MedAlertABI from '../../artifacts/contracts/MedAlert.sol/MedAlert.json';

import deploymentsData from '../../deployments.localhost.json';

type Role = 'ADMIN' | 'DOCTOR' | 'PHARMACY' | 'PATIENT' | null;

interface Web3ContextType {
  account: string | null;
  role: Role;
  isConnecting: boolean;
  registrationContract: ethers.Contract | null;
  medAlertContract: ethers.Contract | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [registrationContract, setRegistrationContract] = useState<ethers.Contract | null>(null);
  const [medAlertContract, setMedAlertContract] = useState<ethers.Contract | null>(null);

  const REGISTRATION_ADDRESS = deploymentsData.contracts.Registration;
  const MEDALERT_ADDRESS = deploymentsData.contracts.MedAlert;

  console.log('Loading contracts from:', {
    Registration: REGISTRATION_ADDRESS,
    MedAlert: MEDALERT_ADDRESS
  });

  const switchToHardhatNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }], // 31337 en hex
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7a69',
                chainName: 'Hardhat Local',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['http://127.0.0.1:8545'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  const initializeContracts = async (signer: ethers.Signer) => {
    try {
      const registration = new ethers.Contract(
        REGISTRATION_ADDRESS,
        RegistrationABI.abi,
        signer
      );

      const medAlert = new ethers.Contract(
        MEDALERT_ADDRESS,
        MedAlertABI.abi,
        signer
      );

      setRegistrationContract(registration);
      setMedAlertContract(medAlert);

      return registration;
    } catch (error) {
      console.error('Error initializing contracts:', error);
      throw error;
    }
  };

  const getUserRole = async (address: string, contract: ethers.Contract): Promise<Role> => {
    try {
      const checksumAddress = ethers.getAddress(address);

      const roleString = await contract.getRole(checksumAddress);

      const owner = await contract.owner();

      if (checksumAddress.toLowerCase() === owner.toLowerCase()) {
        return 'ADMIN';
      }

      return roleString as Role;
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'PATIENT'; // role par défaut
    }
  };

  /**
   * Se connecter au portefeuille MetaMask et demande le réseaux local Hardhat qu'il faut ajouter à son wallet
   * Voir Readme
   */
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    setIsConnecting(true);

    try {
      await switchToHardhatNetwork();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== 31337n) {
        alert(`Wrong network! Please switch to Hardhat Local (Chain ID: 31337) manually in MetaMask. Currently on chain: ${network.chainId}`);
        setIsConnecting(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const userAccount = ethers.getAddress(accounts[0]);
      setAccount(userAccount);

      const signer = await provider.getSigner();

      const registration = await initializeContracts(signer);

      const userRole = await getUserRole(userAccount, registration);
      setRole(userRole);

      localStorage.setItem('walletAddress', userAccount);
      localStorage.setItem('userRole', userRole || '');

      console.log('Connected:', userAccount);
      console.log('Role:', userRole);

    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Make sure Hardhat node is running at http://127.0.0.1:8545');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setRole(null);
    setRegistrationContract(null);
    setMedAlertContract(null);
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('userRole');
  };

  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    const savedRole = localStorage.getItem('userRole') as Role;

    if (savedAddress && savedRole && window.ethereum) {
      const reconnect = async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();

          if (network.chainId !== 31337n) {
            disconnectWallet();
            return;
          }

          const signer = await provider.getSigner();
          const address = await signer.getAddress();

          if (address.toLowerCase() === savedAddress.toLowerCase()) {
            setAccount(address);
            await initializeContracts(signer);
            setRole(savedRole);
          } else {
            disconnectWallet();
          }
        } catch (error) {
          console.error('Error reconnecting:', error);
          disconnectWallet();
        }
      };

      reconnect();
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          disconnectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [account]);

  return (
    <Web3Context.Provider
      value={{
        account,
        role,
        isConnecting,
        registrationContract,
        medAlertContract,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

declare global {
  interface Window {
    ethereum?: any;
  }
}
