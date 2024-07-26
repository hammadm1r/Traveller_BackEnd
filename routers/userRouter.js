const UserController = require('../controllers/userController');
const requireUser = require('../middlewares/requireUser');

const router = require ('express').Router();

router.post('/follow',requireUser , UserController.followOrUnfollowUserController)
router.get('/getpostoffollowing', requireUser , UserController.getPostOfFollowing)
router.get('/getFeedData', requireUser , UserController.getFeedData)
router.get('/getmyposts',requireUser,UserController.getMyPostController)
router.get('/getuserposts',requireUser,UserController.getUserPostController)
router.delete('/',requireUser, UserController.deleteMyProfile)
router.get("/getMyInfo", requireUser,UserController.getMyInfo)

router.put("/",requireUser,UserController.updateUserProfile);
router.post("/getuserProfile",requireUser,UserController.getUserProfile)
module.exports = router;