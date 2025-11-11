import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/use-toast';

const RecoverPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSent(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    }

    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Recuperar Senha - Gerenciador Financeiro</title>
        <meta name="description" content="Recupere sua senha do gerenciador financeiro" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-slate-900/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-800 p-8">
            <Link to="/login" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao login
            </Link>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center mb-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <h2 className="text-3xl font-bold text-center text-white mb-2">Recuperar Senha</h2>
            <p className="text-center text-gray-400 mb-8">
              {sent 
                ? 'Email enviado! Verifique sua caixa de entrada.'
                : 'Digite seu email para receber instruções de recuperação'
              }
            </p>

            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105"
                >
                  {loading ? 'Enviando...' : 'Enviar Email'}
                </Button>
              </form>
            ) : (
              <div className="text-center">
                <Button
                  onClick={() => setSent(false)}
                  variant="outline"
                  className="mt-4"
                >
                  Enviar novamente
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default RecoverPassword;