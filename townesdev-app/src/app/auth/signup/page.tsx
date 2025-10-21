import { SignUpForm } from '../../../components/SignUpForm'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-comet-900 dark:text-white font-heading">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-comet-600 dark:text-comet-400 font-body">
            Join TownesDev today
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
