import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { User, Users, Palette } from 'lucide-react'; // Ícones para as seções
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

// Um componente placeholder para uma futura seção de perfil
const ProfileSettings = ({ profile }) => {
  return (
    <div>
      <p className="text-sm text-slate-600 mb-2">
        <strong>Email:</strong> {profile?.email}
      </p>
      <p className="text-sm text-slate-600 mb-4">
        <strong>Nome:</strong> {profile?.nome_completo || 'Não definido'}
      </p>
      <Button variant="outline">Editar Perfil</Button>
    </div>
  );
};

// Um componente placeholder para uma futura seção de família
const HouseholdSettings = ({ household }) => {
  return (
    <div>
      <p className="text-sm text-slate-600 mb-4">
        Gerencie os membros e convites da sua família.
      </p>
      {/* Este botão navegaria para a página /members que já criamos */}
      <Button variant="outline">Gerenciar Membros</Button>
    </div>
  );
};


// A Página de Configurações
const Settings = () => {
  const { profile, activeHousehold } = useAuth();

  return (
    <>
      <Helmet>
        <title>Configurações - FinanceApp</title>
      </Helmet>

      <div className="space-y-8">
        {/* Cabeçalho da Página */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Gerencie seu perfil, família e preferências.</p>
        </motion.div>

        {/* Grid de Configurações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1: Perfil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/75 backdrop-blur-lg border border-gray-200/80">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <User className="w-8 h-8 text-blue-600" />
                <div>
                  <CardTitle className="text-slate-900">Perfil</CardTitle>
                  <CardDescription>Suas informações pessoais</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ProfileSettings profile={{...profile, email: useAuth().user?.email}} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Família (Household) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/75 backdrop-blur-lg border border-gray-200/80">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Users className="w-8 h-8 text-fuchsia-600" />
                <div>
                  <CardTitle className="text-slate-900">Família</CardTitle>
                  <CardDescription>
                    {activeHousehold?.nome_familia || 'Gerencie sua família'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <HouseholdSettings household={activeHousehold} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3: Aparência (Exemplo futuro) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/75 backdrop-blur-lg border border-gray-200/80">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Palette className="w-8 h-8 text-green-600" />
                <div>
                  <CardTitle className="text-slate-900">Aparência</CardTitle>
                  <CardDescription>Personalize o visual do app</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Em breve...</p>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default Settings;