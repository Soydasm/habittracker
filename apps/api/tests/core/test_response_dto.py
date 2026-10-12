from apps.core.dto import ResponseDTO


def test_success_response_shape():
    result = ResponseDTO.success_response('ok', {'a': 1})
    assert result == {'success': True, 'message': 'ok', 'data': {'a': 1}}


def test_success_response_defaults_data():
    result = ResponseDTO.success_response('ok')
    assert result['data'] == {}
