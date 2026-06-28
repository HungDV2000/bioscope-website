# Strapi 5 production image
FROM node:20-alpine
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev > /dev/null 2>&1
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN npm run build

EXPOSE 1337
CMD ["npm", "run", "start"]
