import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, UserPlus, User, Users, Ticket } from 'lucide-react'; 
import { Helmet } from 'react-helmet';
// 'useAuth' não é mais usado para 'signUp' aqui, mas pode ser mantido se outras funções forem usadas
import { useAuth } from '../contexts/AuthContext'; 
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/use-Toast';
import { supabase } from '../lib/supabaseClient'; // Importamos o supabase diretamente

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nome, setNome] = useState('');
  const [nomeFamilia, setNomeFamilia] = useState('');
  
  const [inviteToken, setInviteToken] = useState(''); 
  const [isInvite, setIsInvite] = useState(false); 
  
  const [loading, setLoading] = useState(false);
  // const { signUp } = useAuth(); // Não usamos mais o signUp do context aqui
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (password !== confirmPassword) {
      toast({ 
        title: "Erro", 
        description: "As senhas não coincidem", 
        variant: "destructive",
        className: "bg-red-600 text-white border-none" // Correção de Estilo
      });
      return;
    }
    if (!nome) {
      toast({ 
        title: "Erro", 
        description: "Por favor, informe seu nome completo.", 
        variant: "destructive",
        className: "bg-red-600 text-white border-none" // Correção de Estilo
      });
      return;
    }
    if (isInvite && !inviteToken) {
      toast({ 
        title: "Erro", 
        description: "Por favor, insira seu token de convite.", 
        variant: "destructive",
        className: "bg-red-600 text-white border-none" // Correção de Estilo
      });
      return;
    }
    if (!isInvite && !nomeFamilia) {
      toast({ 
        title: "Erro", 
        description: "Por favor, informe um nome para sua família.", 
        variant: "destructive",
        className: "bg-red-600 text-white border-none" // Correção de Estilo
      });
      return;
    }

    setLoading(true);

    // --- MUDANÇA PRINCIPAL DA LÓGICA DE ERRO ---
    // Etapa 1: Chamar o auth.signUp diretamente
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      toast({ 
        title: "Erro ao criar conta", 
        description: authError.message, 
        variant: "destructive",
        className: "bg-red-600 text-white border-none" // Correção de Estilo
      });
      setLoading(false);
      return;
    }

    // Etapa 2: Verificar se o signUp retornou um usuário E uma sessão
    // Caso 1: Sucesso com sessão (Email de confirmação DESLIGADO)
    if (authData.user && authData.session) {
      
      // *** A CORREÇÃO MÁGICA ***
      // Define manualmente a sessão para que a próxima chamada RPC (auth.uid()) funcione
      await supabase.auth.setSession(authData.session);
      
      let rpcError;
      if (isInvite) {
        const { error } = await supabase.rpc('join_household_with_token', {
          nome_completo: nome, invite_token: inviteToken
        });
        rpcError = error;
      } else {
        const { error } = await supabase.rpc('register_new_household', {
          nome_completo: nome, nome_familia: nomeFamilia
        });
        rpcError = error;
      }

      if (rpcError) {
        toast({
          title: "Erro ao configurar perfil",
          description: `Sua conta foi criada, mas houve um erro ao configurar sua família. Tente fazer login ou contate o suporte. Erro: ${rpcError.message}`,
          variant: "destructive",
          duration: 7000,
          className: "bg-red-600 text-white border-none" // Correção de Estilo
        });
      } else {
        toast({
          title: "Conta criada e configurada!",
          description: "Bem-vindo! Redirecionando para o app...",
        });
        navigate('/dashboard'); 
      }
    } 
    // Caso 2: Sucesso sem sessão (Email de confirmação LIGADO)
    else if (authData.user && !authData.session) {
      toast({
        title: "Verifique seu email!",
        description: "Enviamos um link de confirmação para sua caixa de entrada. Clique nele para ativar sua conta.",
        duration: 7000,
      });
      navigate('/login'); // Manda o usuário para a tela de login
    }
    // --- FIM DA MUDANÇA ---

    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Cadastro - Gerenciador Financeiro</title>
        <meta name="description" content="Crie sua conta no gerenciador financeiro pessoal" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center mb-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Criar Conta</h2>
            <p className="text-center text-gray-600 mb-8">
              {isInvite ? "Preencha seus dados para entrar na família." : "Comece a gerenciar suas finanças hoje."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Nome Completo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Ana Silva"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Campo Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* --- LÓGICA CONDICIONAL AQUI --- */}
              {isInvite ? (
                // Modo de Convite
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token de Convite
                  </label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      type="text"
                      value={inviteToken}
                      onChange={(e) => setInviteToken(e.target.value)}
                      placeholder="Cole o token de convite aqui"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              ) : (
                // Modo de Nova Família (Mantido)
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Família
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      type="text"
                      value={nomeFamilia}
                      onChange={(e) => setNomeFamilia(e.target.value)}
                      placeholder="Ex: Família Silva"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}
              {/* --- FIM DA LÓGICA CONDICIONAL --- */}

              {/* Campo Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Campo Confirmar Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105"
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>

            {/* Link para trocar de modo */}
            <p className="mt-6 text-center text-sm">
              <Button
                type="button" 
                onClick={() => setIsInvite(!isInvite)}
                variant="outline" 
                className="w-full text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-colors mt-4" 
              >
                {isInvite ? "Não tem convite? Crie uma nova família." : "Já tem um convite?"}
              </Button>
            </p>

            <p className="mt-4 text-center text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Faça login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Register;