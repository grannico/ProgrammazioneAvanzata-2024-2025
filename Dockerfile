FROM node:18-alpine

# Crea la cartella di lavoro nel container
WORKDIR /usr/src/app

# Copia i file dei pacchetti
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il resto del codice
COPY . .

# Compila il progetto TypeScript in JavaScript
RUN npm run build

# Espone la porta 3000
EXPOSE 3000

# Comando per avviare l'app (usa lo script dev definito nel package.json)
CMD ["npm", "run", "dev"]