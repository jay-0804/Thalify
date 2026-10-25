import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { UserCheck, ChefHat, Bike, Radio, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoBar = () => {
  const { user, quickLoginAs } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const handleSwitch = async (role) => {
    const loggedUser = await quickLoginAs(role);
    if (loggedUser) {
      if (role === 'customer') navigate('/providers');
      else if (role === 'provider') navigate('/provider');
      else if (role === 'delivery') navigate('/delivery');
    }
  };

  return (
    <div className="bg-mocha-950 text-mocha-100 text-xs px-4 py-2 border-b border-mocha-800 flex flex-wrap items-center justify-between gap-2 shadow-inner">
      <div className="flex items-center space-x-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 font-semibold border border-gold-500/30">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          Evaluator Demo Switcher
        </span>
        <span className="hidden sm:inline text-mocha-300">
          Instant 1-Click Role Switch:
        </span>
      </div>

      <div className="flex items-center space-x-1.5 sm:space-x-2">
        <button
          onClick={() => handleSwitch('customer')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-smooth ${
            user?.role === 'customer'
              ? 'bg-amber-600 text-white font-bold ring-1 ring-amber-400'
              : 'bg-mocha-900 hover:bg-mocha-800 text-mocha-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Customer (Rohan)</span>
        </button>

        <button
          onClick={() => handleSwitch('provider')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-smooth ${
            user?.role === 'provider'
              ? 'bg-amber-600 text-white font-bold ring-1 ring-amber-400'
              : 'bg-mocha-900 hover:bg-mocha-800 text-mocha-200'
          }`}
        >
          <ChefHat className="w-3.5 h-3.5" />
          <span>Provider (Maa Ki Rasoi)</span>
        </button>

        <button
          onClick={() => handleSwitch('delivery')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-smooth ${
            user?.role === 'delivery'
              ? 'bg-amber-600 text-white font-bold ring-1 ring-amber-400'
              : 'bg-mocha-900 hover:bg-mocha-800 text-mocha-200'
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          <span>Delivery (Ramesh)</span>
        </button>

        <div className="hidden md:flex items-center pl-2 ml-2 border-l border-mocha-800 text-mocha-300">
          <Radio className={`w-3 h-3 mr-1 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-gray-400'}`} />
          <span>{isConnected ? 'Socket Live' : 'Offline'}</span>
        </div>
      </div>
    </div>
  );
};

export default DemoBar;
