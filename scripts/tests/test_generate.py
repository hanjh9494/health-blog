from pathlib import Path
from unittest.mock import patch
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))
import generate


def test_pick_keyword_avoids_used():
    keywords = [
        {"keyword": "단백질 보충제"},
        {"keyword": "다이어트 보조제"},
        {"keyword": "체지방 감량"},
    ]
    used = ["단백질 보충제", "다이어트 보조제"]

    result = generate.pick_keyword(keywords, used)
    assert result["keyword"] == "체지방 감량"


def test_pick_keyword_resets_when_all_used():
    keywords = [{"keyword": "키워드A"}, {"keyword": "키워드B"}]
    used = ["키워드A", "키워드B"]

    with patch("generate.save_used_keywords") as mock_save:
        result = generate.pick_keyword(keywords, used)
        mock_save.assert_called_once_with([])
    assert result["keyword"] in ["키워드A", "키워드B"]


def test_save_post_creates_mdx_file(tmp_path):
    with patch("generate.POSTS_DIR", tmp_path):
        result = {
            "title": "테스트 제목",
            "description": "테스트 설명",
            "content": "## 본문\n\n내용입니다.",
        }
        filename = generate.save_post("단백질 보충제", result)

    assert filename.endswith(".mdx")
    created = tmp_path / filename
    assert created.exists()
    content = created.read_text(encoding="utf-8")
    assert "테스트 제목" in content
    assert "단백질 보충제" in content


def test_save_post_slug_has_no_spaces(tmp_path):
    with patch("generate.POSTS_DIR", tmp_path):
        result = {"title": "제목", "description": "설명", "content": "내용"}
        filename = generate.save_post("단백질 보충제 추천", result)

    assert " " not in filename
