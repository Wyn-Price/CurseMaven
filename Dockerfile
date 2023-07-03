FROM node:18-slim AS build-env
WORKDIR /build
COPY . .
RUN yarn install --frozen-lockfile && yarn build

FROM gcr.io/distroless/nodejs18:nonroot AS run-env
WORKDIR /app

COPY --from=build-env /build/build.js .
COPY public ./public

CMD ["build.js"]