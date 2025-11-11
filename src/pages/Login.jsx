import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/use-Toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Login - Gerenciador Financeiro</title>
        <meta name="description" content="Faça login no seu gerenciador financeiro pessoal" />
      </Helmet>

      {/* Este é o fundo da página inteira, que mantive escuro para o contraste */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* 👇 MUDANÇAS PRINCIPAIS AQUI 👇
            1. 'bg-slate-900/50' -> 'bg-white' (Fundo branco sólido)
            2. 'border-slate-800' -> 'border-gray-200' (Borda clara)
            3. 'backdrop-white-lg' -> 'backdrop-blur-lg' (Corrigi um provável erro de digitação, mas isso é opcional)
          */}
          <div className="bg-white backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center mb-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* 👇 MUDANÇA DE COR DE TEXTO 👇 */}
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Bem-vindo de volta!</h2>
            {/* 👇 MUDANÇA DE COR DE TEXTO 👇 */}
            <p className="text-center text-gray-600 mb-8">Entre na sua conta para continuar</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                {/* 👇 MUDANÇA DE COR DE TEXTO 👇 */}
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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

              <div>
                {/* 👇 MUDANÇA DE COR DE TEXTO 👇 */}
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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

              <div className="flex items-center justify-between">
                <Link
                  to="/recuperar-senha"
                  className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            {/* 👇 MUDANÇA DE COR DE TEXTO 👇 */}
            <p className="mt-8 text-center text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/registro" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">
                Cadastre-se
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
