'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit';
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#1E1E1E',
  borderRadius: 8, // Rounded corners
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)', // Softer shadow
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

const modernButtonStyle = {
  borderRadius: 20,
  textTransform: 'none',
  padding: '8px 16px',
  fontWeight: 600,
  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Soft shadow
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')
  const [editItem, setEditItem] = useState(null)
  const [editItemName, setEditItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data()
      await setDoc(docRef, { quantity: existingQuantity + quantity })
    } else {
      await setDoc(docRef, { quantity: quantity })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const removeAllItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    await deleteDoc(docRef)
    await updateInventory()
  }

  const modifyItem = async (oldName, newName, newQuantity) => {
    const oldDocRef = doc(collection(firestore, 'inventory'), oldName)
    const newDocRef = doc(collection(firestore, 'inventory'), newName)

    // Check if we're changing the item name
    if (oldName !== newName) {
      // Move item to new name
      const oldSnap = await getDoc(oldDocRef)
      if (oldSnap.exists()) {
        await setDoc(newDocRef, { quantity: newQuantity })
        await deleteDoc(oldDocRef)
      }
    } else {
      // Just update quantity
      await setDoc(oldDocRef, { quantity: newQuantity })
    }

    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setItemName('')
    setItemQuantity('')
  }

  const handleEditOpen = (item) => {
    setEditItem(item.name)
    setEditItemName(item.name)
    setItemQuantity(item.quantity)
    setEditOpen(true)
  }

  const handleEditClose = () => {
    setEditOpen(false)
    setEditItem(null)
    setEditItemName('')
    setItemQuantity('')
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      bgcolor={'#121212'} // Dark background for main container
      color={'#E0E0E0'} // Light text color
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" color="#E0E0E0">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              InputProps={{ style: { color: '#E0E0E0' } }} // Light text color for input
              InputLabelProps={{ style: { color: '#E0E0E0' } }} // Light label color
              sx={{ bgcolor: '#333', borderRadius: 4 }} // Dark background and rounded corners
            />
            <TextField
              id="outlined-quantity"
              label="Quantity"
              variant="outlined"
              fullWidth
              type="number"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(Number(e.target.value))}
              InputProps={{ style: { color: '#E0E0E0' } }} // Light text color for input
              InputLabelProps={{ style: { color: '#E0E0E0' } }} // Light label color
              sx={{ bgcolor: '#333', borderRadius: 4 }} // Dark background and rounded corners
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName, itemQuantity)
                handleClose()
              }}
              style={{ color: '#E0E0E0', backgroundColor: '#1E1E1E' }} // Dark background and light text
              sx={modernButtonStyle}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={editOpen}
        onClose={handleEditClose}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="edit-modal-title" variant="h6" component="h2" color="#E0E0E0">
            Modify Item
          </Typography>
          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField
              id="edit-item-name"
              label="Item Name"
              variant="outlined"
              fullWidth
              value={editItemName}
              onChange={(e) => setEditItemName(e.target.value)}
              InputProps={{ style: { color: '#E0E0E0' } }} // Light text color for input
              InputLabelProps={{ style: { color: '#E0E0E0' } }} // Light label color
              sx={{ bgcolor: '#333', borderRadius: 4 }} // Dark background and rounded corners
            />
            <TextField
              id="edit-quantity"
              label="Quantity"
              variant="outlined"
              fullWidth
              type="number"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(Number(e.target.value))}
              InputProps={{ style: { color: '#E0E0E0' } }} // Light text color for input
              InputLabelProps={{ style: { color: '#E0E0E0' } }} // Light label color
              sx={{ bgcolor: '#333', borderRadius: 4 }} // Dark background and rounded corners
            />
            <Button
              variant="contained"
              onClick={() => {
                modifyItem(editItem, editItemName, itemQuantity)
                handleEditClose()
              }}
              style={{ color: '#E0E0E0', backgroundColor: '#1E1E1E' }} // Dark background and light text
              sx={modernButtonStyle}
            >
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>

      <TextField
        id="search-bar"
        label="Search"
        variant="outlined"
        width="100vw"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          marginBottom: 20,
          bgcolor: '#333',
          color: '#E0E0E0',
          borderRadius: 4,
          '& .MuiInputBase-root': { color: '#E0E0E0' }, // Light text color for input
          '& .MuiInputLabel-root': { color: '#E0E0E0' }, // Light label color
        }}
      />

      <Button
        variant="contained"
        onClick={handleOpen}
        style={{ backgroundColor: '#1E1E1E', color: '#E0E0E0' }}
        sx={modernButtonStyle}
      >
        Add New Item
      </Button>

      <Box border={'1px solid #333'} borderRadius={4} padding={2} width="800px">
        <Box
          width="100%"
          height="100px"
          bgcolor={'#424242'}
          borderRadius={4}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'#E0E0E0'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="100%" spacing={2}>
          <Box display="flex" justifyContent="space-between" paddingX={5} bgcolor="#333">
            <Typography variant={'h6'} color={'#E0E0E0'} textAlign={'center'} flex="2">
              Item
            </Typography>
            <Typography variant={'h6'} color={'#E0E0E0'} textAlign={'center'} flex="1">
              Quantity
            </Typography>
            <Typography variant={'h6'} color={'#E0E0E0'} textAlign={'center'} flex="1">
              Actions
            </Typography>
          </Box>
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="50px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#424242'}
              paddingX={5}
              borderRadius={4}
            >
              <Typography variant={'body1'} color={'#E0E0E0'} textAlign={'center'} flex="2">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={'body1'} color={'#E0E0E0'} textAlign={'center'} flex="1">
                {quantity}
              </Typography>
              <Box flex="1" display="flex" justifyContent="flex-end">
                <IconButton onClick={() => handleEditOpen({ name, quantity })} style={{ color: '#E0E0E0' }}>
                  <EditIcon />
                </IconButton>
                <Button
                  variant="contained"
                  onClick={() => removeItem(name)}
                  style={{ marginLeft: 8, backgroundColor: '#E53935', color: '#E0E0E0' }}
                  sx={modernButtonStyle}
                >
                  Remove One
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => removeAllItem(name)}
                  style={{ marginLeft: 8, backgroundColor: '#C62828', color: '#E0E0E0' }}
                  sx={modernButtonStyle}
                >
                  Remove All
                </Button>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
