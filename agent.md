# Deploy do Vértice Frontend (Vercel)

Este repositório publica o frontend do Vértice no projeto Vercel `vertice`.

## Deploy

O diretório já está vinculado ao projeto. No diretório raiz:

```bash
pnpm dlx vercel          # cria um deployment de preview
pnpm dlx vercel --prod   # promove um deployment para produção
```

Quando este repositório estiver conectado ao GitHub pelo Dashboard Vercel,
pushes e pull requests geram previews automaticamente. A branch de produção
(normalmente `main`) gera o deployment de produção.

O endereço padrão será `https://vertice.vercel.app` se estiver disponível. Para
um domínio próprio, adicione-o ao projeto no Dashboard Vercel e configure os
registros DNS solicitados.

## Variáveis de ambiente

Configure no Vercel, para Production e Preview quando aplicável:

- `SUPABASE_URL`: URL pública do projeto Supabase.
- `PIX_COPY_AND_PASTE`: código Pix Copia e Cola exibido ao cliente.
- `PIX_QR_CODE_URL` (opcional): URL pública da imagem do QR Code. Sem ela, a
  aplicação procura `public/pix-qrcode.png`.

O código Pix é público por natureza; ainda assim, use apenas a cobrança Pix
que vocês pretendem receber. Nunca crie no Vercel variáveis contendo
`PAYMENT_APPROVAL_TOKEN` ou `SUPABASE_SERVICE_ROLE_KEY`. Elas pertencem apenas
às Edge Functions do repositório `pladi`.

## Integração de pagamento

1. A página mostra o QR Code e o código Pix configurados depois de validar o
   UUID da sessão do usuário. Antes disso, registra nome e CPF em
   `payment-request`.
2. Após pagar, o cliente seleciona “Já realizei o pagamento”, que chama
   `payment-reported` e registra a confirmação como pendente.
3. Um operador confere o extrato e chama a Edge Function protegida
   `payment-approve`.
4. Envie no WhatsApp o link
   `https://vertice-startup.vercel.app/report?session_id=<UUID_DA_SESSÃO>`.
   A rota `/report` consulta `report-access`: se `paid` for falso, redireciona
   ao pagamento com `payment_pending=true`; se for verdadeiro, exibe o relatório.

Após o primeiro deployment em produção, configure a mesma URL como
`FRONTEND_URL` nos secrets do projeto Supabase e faça novo deploy das funções
`payment-request` e `report-access`.

O frontend usa `/api/config` para obter `SUPABASE_URL`, o payload Pix e a URL
da imagem em runtime. Defina `SUPABASE_URL` como variável de produção no
projeto Vercel; ela é uma URL pública. Não acrescente tokens administrativos a
essa função ou a qualquer variável do Vercel.
