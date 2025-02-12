import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Crown, Building2, Briefcase, Users, Globe, 
  Gem, Sword, Shield, Trophy, Target
} from 'lucide-react';

const ProfitKingdom = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [resources, setResources] = useState({
    gold: 1000000,
    influence: 50,
    power: 75
  });
  const [territories, setTerritories] = useState({
    asia: { controlled: false, wealth: 1200000 },
    europe: { controlled: false, wealth: 1500000 },
    americas: { controlled: false, wealth: 1800000 }
  });

  // Game mechanics
  const conquerTerritory = (region: string) => {
    if (resources.power >= 25 && resources.influence >= 10) {
      setResources(prev => ({
        ...prev,
        power: prev.power - 25,
        influence: prev.influence - 10,
        gold: prev.gold + territories[region].wealth * 0.1
      }));
      setTerritories(prev => ({
        ...prev,
        [region]: { ...prev[region], controlled: true }
      }));
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity
      }
    }
  };

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/attached_assets/caption.jpg')`,
        backgroundAttachment: 'fixed',
        backgroundColor: '#1a1b1e' // Fallback color
      }}
    >
      <div className="container mx-auto p-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Crown className="h-12 w-12 text-yellow-400" />
            <h1 className="text-5xl font-bold text-white">Profit Kingdom</h1>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <motion.div 
              variants={pulseVariants}
              initial="initial"
              animate="pulse"
              className="flex items-center gap-2"
            >
              <Gem className="text-yellow-400" />
              <span className="text-xl text-white">{resources.gold.toLocaleString()} G</span>
            </motion.div>
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="pulse" 
              className="flex items-center gap-2"
            >
              <Target className="text-blue-400" />
              <span className="text-xl text-white">{resources.influence} INF</span>
            </motion.div>
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="pulse"
              className="flex items-center gap-2"
            >
              <Sword className="text-red-400" />
              <span className="text-xl text-white">{resources.power} PWR</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Game Map Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {Object.entries(territories).map(([region, data]) => (
            <motion.div
              key={region}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative ${
                data.controlled ? 'bg-green-900/30' : 'bg-gray-800/30'
              } rounded-lg p-6 cursor-pointer backdrop-blur-sm border border-white/10`}
              onClick={() => !data.controlled && conquerTerritory(region)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold capitalize text-white">{region}</h3>
                {data.controlled ? (
                  <Shield className="text-green-400" />
                ) : (
                  <Trophy className="text-yellow-400" />
                )}
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Territory Wealth: {data.wealth.toLocaleString()} G
              </p>
              {!data.controlled && (
                <div className="absolute bottom-4 right-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 hover:bg-white/30 text-white"
                  >
                    Conquer (25 PWR, 10 INF)
                  </Button>
                </div>
              )}
              <motion.div
                className="absolute inset-0 rounded-lg"
                animate={{
                  boxShadow: data.controlled
                    ? '0 0 20px rgba(34, 197, 94, 0.2)'
                    : '0 0 20px rgba(255, 255, 255, 0.1)',
                }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Economic Sectors */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            variants={itemVariants}
            className="bg-blue-900/20 p-6 rounded-lg backdrop-blur-sm"
          >
            <Building2 className="h-8 w-8 mb-4 text-blue-400" />
            <h3 className="text-xl font-bold mb-2 text-white">Industrial Empire</h3>
            <p className="text-sm text-gray-300">
              Build and manage factories, increase production efficiency
            </p>
            <div className="mt-4">
              <Button className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-white">
                Manage Industries
              </Button>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-purple-900/20 p-6 rounded-lg backdrop-blur-sm"
          >
            <Briefcase className="h-8 w-8 mb-4 text-purple-400" />
            <h3 className="text-xl font-bold mb-2 text-white">Financial District</h3>
            <p className="text-sm text-gray-300">
              Control banks, investments, and market manipulation
            </p>
            <div className="mt-4">
              <Button className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-white">
                Manage Finances
              </Button>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-green-900/20 p-6 rounded-lg backdrop-blur-sm"
          >
            <Globe className="h-8 w-8 mb-4 text-green-400" />
            <h3 className="text-xl font-bold mb-2 text-white">Trade Routes</h3>
            <p className="text-sm text-gray-300">
              Establish global trade networks and resource monopolies
            </p>
            <div className="mt-4">
              <Button className="w-full bg-green-500/20 hover:bg-green-500/30 text-white">
                Manage Trade
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* New Gangster Theme Section */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-red-500 mb-2 uppercase tracking-wider">Intraday Warriors</h3>
              <p className="text-xl font-bold text-gray-300 mb-4">THE GANGWARS WILL BE BACK</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="text-red-400" />
                    <span className="text-red-400 font-semibold">Battle Zone</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-100">$152.30</span>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sword className="text-red-400" />
                    <span className="text-red-400 font-semibold">War Chest</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-100">$1.2M</span>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="text-red-400" />
                    <span className="text-red-400 font-semibold">Territory</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-100">+25.8%</span>
                </div>
              </div>
            </div>
            <div className="w-32 h-32 relative ml-6">
              <img 
                src="/attached_assets/bearded-and-mustached-gangster-skull-vector-23488981.jpg" 
                alt="Gangster Skull"
                className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,0,0,0.3)]"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfitKingdom;