FROM node:16
WORKDIR /app

# Copy package files and install node modules
COPY package*.json ./
RUN npm install

# Copy rest of the files
COPY . .
RUN npm run build

EXPOSE 3040
CMD [ "npm", "start" ]
