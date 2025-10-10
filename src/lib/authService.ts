import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import app from './firebase';

// Initialize Firebase Auth
export const auth = getAuth(app);

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: unknown) {
    console.error('Sign in error:', error);
    const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : '';
    throw new Error(getAuthErrorMessage(errorCode));
  }
}

/**
 * Sign out current user
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Register new user with email and password
 */
export async function register(email: string, password: string, displayName: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    await updateProfile(userCredential.user, {
      displayName: displayName
    });
    
    return userCredential.user;
  } catch (error: unknown) {
    console.error('Registration error:', error);
    const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : '';
    throw new Error(getAuthErrorMessage(errorCode));
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: unknown) {
    console.error('Password reset error:', error);
    const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : '';
    throw new Error(getAuthErrorMessage(errorCode));
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Convert Firebase error codes to user-friendly messages
 */
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Email không hợp lệ';
    case 'auth/user-disabled':
      return 'Tài khoản đã bị vô hiệu hóa';
    case 'auth/user-not-found':
      return 'Không tìm thấy tài khoản với email này';
    case 'auth/wrong-password':
      return 'Mật khẩu không đúng';
    case 'auth/email-already-in-use':
      return 'Email này đã được sử dụng';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu (tối thiểu 6 ký tự)';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng';
    case 'auth/too-many-requests':
      return 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
    default:
      return 'Đã xảy ra lỗi. Vui lòng thử lại';
  }
}

