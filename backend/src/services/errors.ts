// to be used / thrown when no wallet address defined / present
export class S3FileNotFoundError extends Error {
  constructor(message: string) {
    super(message) // Call the parent Error class constructor
    this.name = 'NoSuchKey' // Set the error name
  }
}

export class MissingGrantError extends Error {
  constructor(message: string) {
    super(message) 
    this.name = 'MissingGrant'
  }
}
