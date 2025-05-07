import { doc, getDoc, setDoc } from 'firebase/firestore';
import {db} from './firebaseConnection';
import { UserProps } from '../contexts/authContext';

export async function saveUserDataOnFirestore(uid: string, name: string, email: string) {
  //salva o odcumento no firestore
  await setDoc(doc(db, "users", uid), {
    // salvo o documento na collection users, no uid, no firestore, e passo essas propriedades (name e avatarUrl) pro banco
    name: name,
    email: email,
    avatarUrl: null,
  });

  
}

export async function getUserDataOnFirestore(uid: string): Promise<UserProps> {
  const docRef = doc(db, "users", uid);
  const snapshot = await getDoc(docRef);
  
  if(!snapshot.exists()){
    throw new Error('Usuário não encontrado no banco')
  }
  const data: UserProps = {
    uid: uid,
    name: snapshot.data()?.name,
    email: snapshot.data()?.email,
    avatarUrl: snapshot.data()?.avatarUrl,
  };
  

  return data
}
