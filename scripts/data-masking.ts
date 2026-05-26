/**
 * Firestore Data Masking & Migration Script
 * * Contexto: Exemplo conceitual baseado em experiência real com migração 
 * segura de dados entre ambientes de produção e homologação.
 * * Objetivo: Demonstrar técnica de clonagem de banco Firestore com 
 * mascaramento de dados sensíveis (PII) para conformidade com LGPD.
 * * Stack: Node.js, TypeScript, Firebase Admin SDK
 * Autor: Alana Silva - Desenvolvedora Full Stack
 * * IMPORTANTE: Este é um código autoral e genérico. Não contém lógica 
 * proprietária. Execute apenas em projetos de teste.
 */

import * as admin from 'firebase-admin';

// Força o SDK do Firebase a rodar localmente em modo de teste/emulação via Docker
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;

let sourceConfig: admin.AppOptions;
let destConfig: admin.AppOptions;

if (isEmulator) {
  // Configuração simplificada para o ambiente de testes local 
  sourceConfig = { projectId: 'mock-prod-database' };
  destConfig = { projectId: 'mock-stage-database' };
} else {
  // Carrega credenciais reais via variáveis de ambiente em produção/homologação 
  const sourceServiceAccount = JSON.parse(process.env.FIREBASE_SOURCE_KEY || '{}');
  const destinationServiceAccount = JSON.parse(process.env.FIREBASE_DEST_KEY || '{}');

  sourceConfig = { credential: admin.credential.cert(sourceServiceAccount) };
  destConfig = { credential: admin.credential.cert(destinationServiceAccount) };
}

// Inicializa apps Firebase para source (Origem) e destination (Destino)
const sourceApp = admin.initializeApp(sourceConfig, 'sourceApp');
const sourceDb = sourceApp.firestore();

const destinationApp = admin.initializeApp(destConfig, 'destinationApp');
const destinationDb = destinationApp.firestore();

// Coleções genéricas para exemplo - troque pelos nomes do seu projeto
const COLLECTIONS_TO_MIGRATE = [
  'users',
  'profiles', 
  'posts',
  'comments',
  'settings'
];

/**
 * Deleta todos os documentos de uma coleção no banco de destino
 * Garante ambiente limpo antes da migração
 */
async function deleteCollection(collectionName: string): Promise<void> {
  const collectionRef = destinationDb.collection(collectionName);
  const snapshot = await collectionRef.get();
  
  if (!snapshot.empty) {
    const batch = destinationDb.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`✓ Coleção ${collectionName} limpa com sucesso.`);
  } else {
    console.log(`→ Coleção ${collectionName} já estava vazia.`);
  }
}

/**
 * Copia todos os documentos de uma coleção entre ambientes
 */
async function copyCollection(collectionName: string): Promise<void> {
  const snapshot = await sourceDb.collection(collectionName).get();
  const batch = destinationDb.batch();
  
  snapshot.docs.forEach(doc => {
    const destRef = destinationDb.collection(collectionName).doc(doc.id);
    batch.set(destRef, doc.data());
  });
  
  await batch.commit();
  console.log(`✓ ${snapshot.size} docs copiados para ${collectionName}`);
}

/**
 * Mascara dados sensíveis de usuários no ambiente de destino
 * Essencial para conformidade LGPD em ambientes de dev/test
 */
async function maskSensitiveUserData(): Promise<void> {
  const snapshot = await destinationDb.collection('users').get();
  const batch = destinationDb.batch();
  
  snapshot.docs.forEach((doc, index) => {
    const maskedData = {
      email: `user_${index}@test.local`, // Remove PII real
      name: `Test User ${index}`,        // Anonimiza nome
      document: '000.000.000-00',        // Mascara CPF/CNPJ
      phone: '+55 00 00000-0000'         // Mascara telefone
    };
    batch.update(doc.ref, maskedData);
  });
  
  await batch.commit();
  console.log(`✓ ${snapshot.size} usuários anonimizados.`);
}

/**
 * Orquestra todo o processo: limpa → copia → mascara
 */
async function migrateAndMask(): Promise<void> {
  try {
    console.log('Iniciando migração segura...');
    
    // 1. Limpa ambiente de destino
    for (const collection of COLLECTIONS_TO_MIGRATE) {
      await deleteCollection(collection);
    }
    
    // 2. Copia dados de produção
    for (const collection of COLLECTIONS_TO_MIGRATE) {
      await copyCollection(collection);
    }
    
    // 3. Mascara PII dos usuários
    await maskSensitiveUserData();
    
    console.log('✅ Migração e mascaramento concluídos com sucesso');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    process.exit(1);
  }
}

migrateAndMask();