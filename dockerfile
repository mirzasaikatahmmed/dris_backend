# base image
FROM node:22-alpine

# setting work directory inside alpine 
WORKDIR /app

# copying package json files to /app 
COPY package*.json ./

# run npm install 
RUN npm install

# copy current code inside the container
COPY . .

# run prisma migrations
ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate

# run app build 
RUN npm run build

# expose the port
EXPOSE 3000

# run npm start 
CMD ["npm", "start"]
