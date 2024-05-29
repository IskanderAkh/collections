import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js'
import { createCollection, createCollectionWithPost, deleteCollection, getAllCollections } from '../controllers/collectionController.js'

const route = express.Router()

route.get('/all', getAllCollections)
route.post('/create', createCollection);
route.post('/createCwP', protectRoute, createCollectionWithPost);
route.delete('/:id', protectRoute, deleteCollection)


export default route