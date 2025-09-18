import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-lg shadow-xl w-96 border border-yellow-800/30">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            <span className="text-white">MY</span>
            <span className="text-yellow-500">PODS</span>
          </h1>
          <p className="text-gray-400 mt-2">Painel Administrativo</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
