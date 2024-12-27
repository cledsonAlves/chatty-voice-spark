import sanityClient from '@sanity/client';

const client = sanityClient({
  projectId: 'lytzs5rr', // Substitua pelo seu ID do projeto no Sanity
  dataset: 'production', // Substitua pelo dataset (geralmente 'production')
  apiVersion: '2023-01-01', // Versão da API (use uma recente)
  useCdn: true, // Use `true` para consultas rápidas (não requer dados mais recentes)
});

export default client;
