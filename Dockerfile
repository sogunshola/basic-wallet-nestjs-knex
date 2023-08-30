# FROM node:16-alpine AS development
# WORKDIR /app
# COPY . .
# RUN npm install
# RUN npm run build

# FROM node:16-alpine
# WORKDIR /app
# # copy from build image
# COPY --from=development /app/dist ./dist
# COPY --from=development /app/node_modules ./node_modules
# COPY package.json ./
# # RUN npm run knex:migrate:latest
# CMD ["npm", "run", "start:dev"]


# FROM node:16-alpine AS production
# WORKDIR /app
# COPY . .
# RUN npm install
# RUN npm run build

# FROM node:16-alpine
# WORKDIR /app
# # copy from build image
# COPY --from=production /app/dist ./dist
# COPY --from=production /app/node_modules ./node_modules
# COPY package.json ./
# EXPOSE 3000
# # RUN npm run knex:migrate:latest
# CMD ["npm", "run", "start:prod"]


FROM node:16-alpine AS development
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:16-alpine AS production
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:16-alpine
WORKDIR /app
# copy from build image
COPY --from=production /app/dist ./dist
COPY --from=production /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
# RUN npm run knex:migrate:latest
CMD ["npm", "run", "start:prod"]