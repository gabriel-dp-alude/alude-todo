import { useState, useRef, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Button, Input, InputRef, Typography } from "antd";
import { TextProps } from "antd/es/typography/Text";
import { DeleteOutlined } from "@ant-design/icons";

interface EditableTextI extends TextProps {
  text: string;
  update: (newText: string) => Promise<void> | void;
  remove?: () => Promise<void> | void;
}

export const EditableText = observer(({ text, update, remove, ...rest }: EditableTextI) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const save = () => {
    const trimmed = value?.trim();
    if (trimmed && trimmed !== text) {
      update(trimmed);
    } else {
      setValue(text);
    }
    setEditing(false);
  };

  const cancel = () => {
    setValue(text);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ flex: 1, display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onPressEnter={save}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Escape") cancel();
          }}
        />
        <Button
          danger
          icon={<DeleteOutlined />}
          size="small"
          onMouseDown={(e) => {
            if (remove) {
              remove();
              e.preventDefault();
            }
          }}
          style={{ marginRight: "0.5rem" }}
        />
      </div>
    );
  }

  return (
    <Typography.Text {...rest} style={{ cursor: "pointer", ...rest.style }} onDoubleClick={() => setEditing(true)}>
      {text}
    </Typography.Text>
  );
});
