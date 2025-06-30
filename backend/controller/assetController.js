const assetModel = require("../model/assetModel");

async function getAsset(req, res) {
  const { userId } = req.query;

  try {
    const result = await assetModel.getAsset(userId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("자산 오류:", error);
    return res
      .status(500)
      .json({ message: "자산을 불러오던 중 문제가 발생하였습니다." });
  }
}

module.exports = { getAsset };
