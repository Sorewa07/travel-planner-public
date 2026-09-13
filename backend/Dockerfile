# --- ステージ1: Mavenを使ってクラウド上でJavaをビルドする環境 ---
FROM maven:3.8.8-eclipse-temurin-21-alpine AS build
COPY . .
RUN mvn clean package -DskipTests

# --- ステージ2: 成果物（jar）だけを取り出して、軽量に起動する本番環境 ---
FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp
COPY --from=build /target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
