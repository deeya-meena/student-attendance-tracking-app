"use client"
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';

function AddNewStudent() {
  const [open,setOpen]=useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const onSubmit=(data)=>{
    console.log("FormData",data);
  }
  return (
    <div>
         <Button onClick={()=>setOpen(true)}>+ Add New Student</Button>
         <Dialog open={open}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                <form onSubmit={handleSubmit(onSubmit)}>
                <div className='py-2'>
                    <label>Full Name</label>
                    <Input placeholder='Ex. Jhon Carry' 
                    {...register('name',{required:true})}
                    />
                </div>
                <div className='flex flex-col py-2'>
                   <label>Select Grade</label>
                   <select className='p-3 border rounded-lg'
                   {...register('grade',{required:true})}>
                       <option value={'5th'}>5th</option>
                       <option value={'6th'}>6th</option>
                       <option value={'7th'}>7th</option>
                   </select>
                </div>
                <div className='py-2'>
                    <label>Contact Number</label>
                    <Input placeholder='Ex. 987654321' 
                    {...register('contact')}/>
                </div>
                <div className='py-2'>
                    <label>Address</label>
                    <Input placeholder='Ex. 525 N tryon Streen, NC' 
                    {...register('address')}/>
                </div>
                <div className='flex gap-3 items-center justify-end mt-5'>
                   <Button onClick={()=>setOpen(false)} variant="ghost">Cancel</Button>
                   <Button 
                   type="submit"
                   onClick={()=>console.log(save)}>Save</Button>
                </div>
                </form>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddNewStudent