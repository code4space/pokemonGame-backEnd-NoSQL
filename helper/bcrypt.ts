const bcrypt = require('bcryptjs')

export const hashPassword = (password): string => bcrypt.hashSync(password, 10)
export const comparePassword = (password, hashingPassword): boolean => bcrypt.compareSync(password, hashingPassword)
