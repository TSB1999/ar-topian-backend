const { db } = require("../util/admin");

export const getAllItems = (req: any, res: any) => {
  db.collection("items")
    .orderBy("addedAt", "desc")
    .get()
    .then((data: any) => {
      let items: any = [];
      data.forEach((doc: any) => {
        items.push(doc.data());
      });
      return res.json(items);
    })
    .catch((err: any) => console.error(err));
};

export const addItem = (req: any, res: any) => {
  const newItem = {
    type: req.body.type,
    name: req.body.name,
    small: req.body.small,
    medium: req.body.medium,
    large: req.body.large,
    extra_large: req.body.extra_large,
    addedAt: new Date().toISOString(),
  };

  db.collection("items")
    .add(newItem)
    .then((doc: any) => {
      res.json({ message: `document ${doc.id} created succesfully` });
    })
    .catch((err: any) => {
      // if(err == "auth/argument-error") some error about having the wrong authentication
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};
