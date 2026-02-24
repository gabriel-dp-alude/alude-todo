# Alude ToDo

This is the Alude's welcome project. The idea is to build a To-Do List using the tech stack used in internal repositories.

In addition to using the same stack, I tried to apply the same code practices.

&nbsp;

## Structure

The project is composed by three parts:

- [Database](./database/)
  - PostgreSQL
  - Liquibase
- [Server](./server/)
  - Python
  - Quart
  - SQL Alchemy
- [Client](./client/)
  - TypeScript
  - React
  - Mobx-State-Tree
  - Ant Design

Docker manages all containers.

&nbsp;

## How to run

### Configure environment variables

> There is a `.env.example` file in each subfolder, copy it to a `.env` file and configure it as you wish. \
> Keep in mind that variables must be synced to garantee communication.

### Run the containers

> Use Docker Compose to run containers.
>
>```bash
>docker compose up --build
>```

### Access the resources

> Default URLs are \
> `Server:` `http://localhost:8000` \
> `Client:` `http://localhost:3000`
