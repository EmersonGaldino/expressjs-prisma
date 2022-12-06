import { PrismaClient } from "@prisma/client";
import { json } from "body-parser";
import express from "express";

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));

app.get("/todos", async (req, res) => {
  const todos = await prisma.todo.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(todos);
});

app.post("/todos", async (req, res) => {
  const create = await prisma.todo.create({
    data: {
      completed: false,
      createdAt: new Date(),
      text: req.body.text ?? "Empty todo",
    },
  });

  return res.json(create);
});

app.get("/todos/:id", async (req, res) => {
  const id = req.params.id;
  const todo = await prisma.todo.findUnique({
    where: { id },
  });

  return res.json(todo);
});

app.put("/todos/:id", async (req, res) => {
  const id = req.params.id;
  const todo = await prisma.todo.update({
    where: { id },
    data: req.body,
  });

  return res.json(todo);
});

app.delete("/todos/:id", async (req, res) => {
  const id = req.params.id;
  await prisma.todo.delete({
    where: { id },
  });



  return res.send({ status: "ok" });
});


app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      Email: true,
      Login: true,
      id: true,
      Name: true,

      Favorites: {

        include: {
          Films: {
            select: {
              Link: true,
              Name: true
            }
          },

        }
      }
    },
    orderBy: { createdAt: "desc" },
  })

  return res.json({
    data: users
  })
})

app.post('/user', async (req, res) => {
  let { Email, Password, Name, Login } = req.body;
  const user = await prisma.user.findUnique({

    where: { Email }
  })
  if (user) {
    if (user?.Email == Email)
      return res.status(400).send({ Message: 'Email já esta em uso' })

    if (user?.Login == Login)
      return res.status(400).send({ Message: 'Usuário já esta cadastrado' })
  }

  const create = await prisma.user.create({
    data: {
      Email,
      Name,
      Password: await bcrypt.hash(Password, 10).then((passHashed: String) => {
        return passHashed
      }),
      Login

    }
  })

  return res.json({ message: 'Usuário criado com sucesso.' })

})

app.post('/authentication', async (req, res) => {
  let { Login, Password } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      Login
    },

  })
  if (!await bcrypt.compare(Password, user?.Password))
    return res.status(404).json({ Message: 'Não foi possivel logar, tente novamente.' })


  let token: string = await jwt.sign({ name: user?.Name, UserId: user?.id }, process.env.TOKEN_SECRET, { expiresIn: '24h' })
  let experies = new Date(Date.now() + 1)
  return res.json({
    user: user?.Email,
    name: user?.Name,
    access_token: token,
    ExpireIn: experies
  })
})

app.get('/moves', async (req, res) => {
  let token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    res.status(400).json({ success: false, message: "Error!Token was not provided." });
  }
  if (await jwt.verify(token, process.env.TOKEN_SECRET)) {
    const moves = await prisma.move.findMany({
      select: {
        Category: {
          select: {
            Name: true
          }
        },
        id: true,
        Link: true,
        Name: true,
        Clicks: true,
        createdAt: false
      },
      orderBy: { createdAt: "asc" }
    })
    return res.json({
      data: moves,
    })
  }
  return res.status(400).json({ Message: 'Não foi possivel validar seu token, tente novamente' })
})

app.get('/category/:id', async (req, res) => {
  let id = req.params.id;
  const moves = await prisma.move.findMany({
    select: {
      Name: true,
      Link: true,
      id: true,
      Category: {
        select: {
          Name: true
        }
      }

    }, where: {
      categoryId: id
    }
  })
  return res.json({
    data: moves
  })
})

app.get('/categories', async (req, res) => {
  let token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    res.status(400).json({ success: false, message: "Error!Token was not provided." });
  }

  if (await jwt.verify(token, process.env.TOKEN_SECRET)) {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" }
    })
    return res.json({ data: categories })
  }

})



app.get("/", async (req, res) => {
  res.send(
    `
  <h1>Todo REST API</h1>
  <h2>Available Routes</h2>
  <pre>
    GET, POST /todos
    GET, PUT, DELETE /todos/:id
  </pre>
  `.trim(),
  );
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
