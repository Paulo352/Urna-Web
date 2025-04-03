// src/config/firebase.js

// Importações dos serviços do Firebase que você vai usar
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  // Para o banco de dados
import { getAuth } from "firebase/auth";            // Para autenticação
import { getStorage } from "firebase/storage";      // Para armazenar fotos (opcional)

// Sua configuração do Firebase (mantenha os valores que ele te deu)
const firebaseConfig = {
  apiKey: "AIzaSyDSQ27gCJjRPie_MmfPh8piIcd2a3g49DA",
    authDomain: "urna-eletronica-a9c6d.firebaseapp.com",
      projectId: "urna-eletronica-a9c6d",
        storageBucket: "urna-eletronica-a9c6d.firebasestorage.app",
          messagingSenderId: "824557269101",
            appId: "1:824557269101:web:9bb9e1132f5fe4831d4f64"
            };

            // Inicialize o Firebase
            const app = initializeApp(firebaseConfig);

            // Exporte os serviços que você vai usar no projeto
            export const db = getFirestore(app);      // Banco de dados Firestore
            export const auth = getAuth(app);         // Autenticação
            export const storage = getStorage(app);   // Armazenamento (opcional)

            /* --- Dica profissional --- */
            // Se estiver usando Next.js, adicione isso para evitar reinicializações:
            if (typeof window !== 'undefined' && !global._firebaseInitialized) {
              global._firebaseInitialized = true;
              }