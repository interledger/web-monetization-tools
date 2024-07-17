import type { Request, Response } from "express"
import fs from "fs/promises"

const dataPath = "data/default_config.json"

export const getDefault = async (req: Request, res: Response) => {
  try {
    const data = await fs.readFile(dataPath, {
      encoding: "utf8"
    })

    res.status(200).send(JSON.parse(data))
  } catch (error) {
    console.log(error)
    res.status(500).send("An error occurred when fetching data")
  }
}

export const saveUserConfig = async (req: Request, res: Response) => {
  try {
    const id = req.params.id
    const data = req.body

    res.status(200).send(data)
  } catch (error) {
    console.log(error)
    res.status(500).send("An error occurred when saving data")
  }
}

export default {
  getDefault,
  saveUserConfig
}
