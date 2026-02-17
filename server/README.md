# alude-todo-server

Instructions to use the server of this project

&nbsp;

## How to run

All instructions below refers only to server. Remember to switch to the server folder.

```bash
cd server
```

&nbsp;

### Environment variables

> Create the `.env`file based on `.env.example`. \
> Modify it as you wish, but remember to synchronize with [database](../database/) environment.
>
> ```bash
> cp .env.example .env
> ```

&nbsp;

### Development setup

VS Code editor intellisense cannot have access to the installed libraries, so follow the steps below.

#### Step 1

> Create a virtual environment
>
> ```bash
> python3 -m venv .venv
> ```

#### Step 2

> Activate the environment
>
> ```bash
> source .venv/bin/activate
> ```

#### Step 3

> Configure VS Code to use the virtual environment's interpreter. \
> (`Ctrl + Shift + P` and `Python: Select interpreter`)

#### Step 4

> Install poetry and the dependencies
>
> ```bash
> pip install poetry && poetry install
> ```

__Important__: Every time you update dependencies, rebuild the docker image with `--build` flag.
