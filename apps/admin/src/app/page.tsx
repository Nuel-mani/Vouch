import { redirect } from 'next/navigation';

export default function AdminHome() {
    // Redirect to login - middleware will redirect to dashboard if already authenticated
    redirect('/login');
}
