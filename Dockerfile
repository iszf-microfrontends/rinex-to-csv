FROM node:16.20.0-alpine3.16 as base

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:16-alpine3.17

WORKDIR /app

COPY --from=base /app/dist ./dist

COPY package*.json yarn.lock ./

RUN apk --no-cache add curl

EXPOSE 9001

CMD ["yarn", "serve"]