const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findAll({
      include: [
        { model: Product },
      ],
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const singleCategory = await Category.findByPk(req.params.id, {
      include: [{
        model: Product
      }
      ],
    });
    if (!singleCategory) {
      res.status(404).json({ message: "No category found with that id" });
      return;
    }
    res.status(200).json(singleCategory);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new category
  await Category.create({ category_name: req.body.category_name }).then((newCategory) => {
    res.json(newCategory);
  })
    .catch((err) => {
      res.json(err);
    })
});


//Work on this!!! not updating correctly
router.put('/:id', (req, res) => {
  // update a category by its `id` value
  Category.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((category) => {
      if (req.body.id && req.body.id.length) {

        Category.findAll({
          where: { id: req.params.id }
        }).then((categories) => {
          const categoryId = categories.map(({ id }) => id);
          const newCategory = req.body.id
            .filter((id) => !categoryId.includes(id))
            .map((id) => {
              return {
                id: req.params.id,
                id,
              };
            })
          const categoriesToRemove = categories
            .filter(({ id }) => !req.body.id.includes(id))
            .map(({ id }) => id);
          return Promise.all([
            Category.destroy({ where: { id: categoriesToRemove } }),
            Category.bulkCreate(newCategory),
          ]);
        });
      }
      return res.json(category);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value
  Category.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((destroyedCategory) => {
      res.status(200).json(destroyedCategory);
    })
    .catch((err) => res.status(500).json(err));
});

module.exports = router;
